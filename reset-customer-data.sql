-- ONE-TIME RESET: remove customer bills, points, and redemption history.
-- Customer accounts, owner accounts, sessions, and application settings remain.
-- Run this script manually in the Supabase SQL Editor.

begin;

delete from public.redemptions;
delete from public.bills;

commit;
