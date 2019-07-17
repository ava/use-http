module.exports = {
  posts: [
    { id: 1, title: 'Lorem Ipsum', views: 254, userId: 123 },
    { id: 2, title: 'Sic Dolor amet', views: 65, userId: 456 },
  ],
  users: [{ id: 123, name: 'John Doe' }, { id: 456, name: 'Jane Doe' }],
  comments: [
    {
      id: 987,
      postId: 1,
      body: 'Consectetur adipiscing elit',
      date: new Date('2017-07-03'),
    },
    {
      id: 995,
      postId: 1,
      body: 'Nam molestie pellentesque dui',
      date: new Date('2017-08-17'),
    },
  ],
}
