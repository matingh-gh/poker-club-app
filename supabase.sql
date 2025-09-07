create extension if not exists "uuid-ossp";

create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamp with time zone default now()
);

create type if not exists session_type as enum ('tournament','cashgame');
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  type session_type not null,
  date date not null default current_date,
  blindup_interval_minutes int,
  rebuy_freeze_hhmm text,
  hours_to_play int,
  status text default 'active',
  created_at timestamp with time zone default now()
);

create table if not exists session_players (
  session_id uuid references sessions(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  created_at timestamp with time zone default now(),
  initial_buyin numeric not null default 0,
  total_buyin numeric not null default 0,
  out_at timestamp with time zone,
  finish_position int,
  stack_end numeric,
  primary key (session_id, player_id)
);

create table if not exists buyins (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  amount numeric not null,
  created_at timestamp with time zone default now()
);

create table if not exists settings (
  id text primary key,
  value text
);

create or replace view session_players_detail as
select sp.*, p.name as player_name
from session_players sp
join players p on p.id = sp.player_id;

create or replace view ranking_tournaments as
with base as (
  select
    p.id as player_id, p.name as player_name,
    count(*) filter (where sp.finish_position is not null) as played,
    count(*) filter (where sp.finish_position = 1) as firsts,
    count(*) filter (where sp.finish_position = 2) as seconds,
    count(*) filter (where sp.finish_position = 3) as thirds
  from players p
  left join session_players sp on sp.player_id = p.id
  left join sessions s on s.id = sp.session_id and s.type = 'tournament'
  group by p.id, p.name
)
select
  player_id, player_name, played, firsts, seconds, thirds,
  (firsts*5 + seconds*3 + thirds*1) as points
from base;

create or replace view cashgame_results as
select
  sp.session_id, sp.player_id, p.name as player_name,
  coalesce(sp.stack_end,0) - coalesce(sp.total_buyin,0) as net
from session_players sp
join sessions s on s.id = sp.session_id and s.type = 'cashgame'
join players p on p.id = sp.player_id;

create or replace view ranking_cashgames as
select
  player_id, player_name,
  count(*) as played,
  sum(net) as net_winnings
from cashgame_results
group by player_id, player_name;

create or replace function recompute_total_buyin(p_session_id uuid, p_player_id uuid)
returns void language plpgsql as $$
begin
  update session_players sp
  set total_buyin = (
    select coalesce(sum(amount),0)
    from buyins b
    where b.session_id = p_session_id and b.player_id = p_player_id
  )
  where sp.session_id = p_session_id and sp.player_id = p_player_id;
end; $$;

create or replace function update_tournament_points(p_session_id uuid)
returns void language plpgsql as $$ begin return; end; $$;

create or replace function finalize_cashgame_results(p_session_id uuid)
returns void language plpgsql as $$ begin return; end; $$;

alter table players enable row level security;
alter table sessions enable row level security;
alter table session_players enable row level security;
alter table buyins enable row level security;
alter table settings enable row level security;

create policy "public read players" on players for select using (true);
create policy "public write players" on players for all using (true) with check (true);

create policy "public read sessions" on sessions for select using (true);
create policy "public write sessions" on sessions for all using (true) with check (true);

create policy "public read session_players" on session_players for select using (true);
create policy "public write session_players" on session_players for all using (true) with check (true);

create policy "public read buyins" on buyins for select using (true);
create policy "public write buyins" on buyins for all using (true) with check (true);

create policy "public read settings" on settings for select using (true);
create policy "public write settings" on settings for all using (true) with check (true);
