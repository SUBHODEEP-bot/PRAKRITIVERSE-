-- Add RLS policies to enable NGO and Institution roles to manage content
-- IMPORTANT: We add additional permissive policies instead of altering existing ones

-- ECO CHALLENGES: allow NGO and Institution to manage
CREATE POLICY "NGO and Institution can manage challenges"
ON public.eco_challenges
FOR ALL
USING (
  has_role(auth.uid(), 'ngo'::app_role)
  OR has_role(auth.uid(), 'institution'::app_role)
  OR (auth.uid() = created_by)
)
WITH CHECK (
  has_role(auth.uid(), 'ngo'::app_role)
  OR has_role(auth.uid(), 'institution'::app_role)
  OR (auth.uid() = created_by)
);

-- ECO TIPS: allow NGO and Institution to manage
CREATE POLICY "NGO and Institution can manage eco tips"
ON public.eco_tips
FOR ALL
USING (
  has_role(auth.uid(), 'ngo'::app_role)
  OR has_role(auth.uid(), 'institution'::app_role)
  OR (auth.uid() = created_by)
)
WITH CHECK (
  has_role(auth.uid(), 'ngo'::app_role)
  OR has_role(auth.uid(), 'institution'::app_role)
  OR (auth.uid() = created_by)
);

-- ECO COURSES: allow Institution (and retain Teacher/Admin via existing policies)
CREATE POLICY "Institutions can manage courses"
ON public.eco_courses
FOR ALL
USING (
  has_role(auth.uid(), 'institution'::app_role)
  OR (auth.uid() = created_by)
)
WITH CHECK (
  has_role(auth.uid(), 'institution'::app_role)
  OR (auth.uid() = created_by)
);
