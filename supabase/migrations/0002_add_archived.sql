alter table events add column archived boolean not null default false;

create index events_archived_idx on events(archived);
