-- Step 20: clicks made by company mail filters within 3 minutes of sending are not real clicks.
UPDATE outreach_events e SET type = 'scan'
  FROM outreach_leads l
 WHERE e.lead_id = l.id AND e.type = 'click'
   AND EXISTS (SELECT 1 FROM outreach_events s WHERE s.lead_id = e.lead_id AND s.type = 'sent'
               AND e.created_at >= s.created_at AND e.created_at < s.created_at + interval '3 minutes');
UPDATE outreach_leads l SET clicked_at = (SELECT min(created_at) FROM outreach_events e WHERE e.lead_id = l.id AND e.type = 'click')
 WHERE l.clicked_at IS NOT NULL;
SELECT count(*) FILTER (WHERE type = 'click') AS real_clicks, count(*) FILTER (WHERE type = 'scan') AS filter_checks FROM outreach_events;
