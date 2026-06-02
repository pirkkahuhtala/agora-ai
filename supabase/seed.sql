-- Demo room — fixed ID used by the app
insert into rooms (id, topic)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'The future of open-source AI'
)
on conflict (id) do nothing;
