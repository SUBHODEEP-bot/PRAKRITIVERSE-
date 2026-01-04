import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, file_data, file_info } = await req.json();

    let result;

    switch (action) {
      case 'upload_file':
        const { file_name, file_content, purpose, related_entity_id, is_public = false } = file_data;
        const { file_size, mime_type } = file_info;
        
        // Determine bucket based on purpose
        let bucket_name;
        switch (purpose) {
          case 'avatar':
            bucket_name = 'avatars';
            break;
          case 'eco_action_proof':
            bucket_name = 'action-proofs';
            break;
          case 'course_material':
            bucket_name = 'course-materials';
            break;
          default:
            bucket_name = 'general';
        }

        // Generate unique file path
        const file_extension = file_name.split('.').pop();
        const unique_file_name = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${file_extension}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket_name)
          .upload(unique_file_name, file_content, {
            contentType: mime_type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Record file upload in database
        const { data: fileRecord, error: fileError } = await supabase
          .from('file_uploads')
          .insert({
            user_id: user.id,
            file_name,
            file_path: uploadData.path,
            file_size,
            mime_type,
            bucket_name,
            purpose,
            related_entity_id,
            is_public
          })
          .select()
          .single();

        if (fileError) throw fileError;

        // Get public URL if public file
        let public_url = null;
        if (is_public) {
          const { data: publicUrlData } = supabase.storage
            .from(bucket_name)
            .getPublicUrl(uploadData.path);
          public_url = publicUrlData.publicUrl;
        }

        result = { 
          file_record: fileRecord,
          public_url,
          success: true 
        };
        break;

      case 'delete_file':
        const { file_id } = file_data;
        
        // Get file record
        const { data: fileToDelete, error: getFileError } = await supabase
          .from('file_uploads')
          .select('*')
          .eq('id', file_id)
          .eq('user_id', user.id)
          .single();

        if (getFileError) throw getFileError;

        // Delete from storage
        const { error: deleteStorageError } = await supabase.storage
          .from(fileToDelete.bucket_name)
          .remove([fileToDelete.file_path]);

        if (deleteStorageError) throw deleteStorageError;

        // Delete record from database
        const { error: deleteRecordError } = await supabase
          .from('file_uploads')
          .delete()
          .eq('id', file_id)
          .eq('user_id', user.id);

        if (deleteRecordError) throw deleteRecordError;

        result = { success: true };
        break;

      case 'get_user_files':
        const { purpose: filterPurpose, limit = 50 } = file_data || {};
        
        let query = supabase
          .from('file_uploads')
          .select('*')
          .eq('user_id', user.id);
        
        if (filterPurpose) {
          query = query.eq('purpose', filterPurpose);
        }
        
        const { data: userFiles, error: filesError } = await query
          .order('created_at', { ascending: false })
          .limit(limit);

        if (filesError) throw filesError;

        // Add signed URLs for non-public files
        const filesWithUrls = await Promise.all(
          userFiles.map(async (file) => {
            if (file.is_public) {
              const { data: publicUrlData } = supabase.storage
                .from(file.bucket_name)
                .getPublicUrl(file.file_path);
              return { ...file, url: publicUrlData.publicUrl };
            } else {
              const { data: signedUrlData, error: urlError } = await supabase.storage
                .from(file.bucket_name)
                .createSignedUrl(file.file_path, 3600); // 1 hour expiry
              
              if (urlError) {
                console.error('Error creating signed URL:', urlError);
                return { ...file, url: null };
              }
              
              return { ...file, url: signedUrlData.signedUrl };
            }
          })
        );

        result = { files: filesWithUrls };
        break;

      case 'get_file_url':
        const { file_id: urlFileId, expires_in = 3600 } = file_data;
        
        const { data: file, error: getFileUrlError } = await supabase
          .from('file_uploads')
          .select('*')
          .eq('id', urlFileId)
          .eq('user_id', user.id)
          .single();

        if (getFileUrlError) throw getFileUrlError;

        let file_url;
        if (file.is_public) {
          const { data: publicUrlData } = supabase.storage
            .from(file.bucket_name)
            .getPublicUrl(file.file_path);
          file_url = publicUrlData.publicUrl;
        } else {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(file.bucket_name)
            .createSignedUrl(file.file_path, expires_in);
          
          if (signedUrlError) throw signedUrlError;
          file_url = signedUrlData.signedUrl;
        }

        result = { url: file_url };
        break;

      case 'update_file_metadata':
        const { file_id: updateFileId, metadata } = file_data;
        
        const { error: updateError } = await supabase
          .from('file_uploads')
          .update(metadata)
          .eq('id', updateFileId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        result = { success: true };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`File management action ${action} completed for user:`, user.id);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in file management:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});