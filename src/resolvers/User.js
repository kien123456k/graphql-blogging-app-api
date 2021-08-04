import getUserId from "../utils/getUserId";

const User = {
  email(parent, _, { request }, _1) {
    const userId = getUserId(request, false);

    if (userId && userId === parent.id) {
      return parent.email;
    } else {
      return null;
    }
  },
  posts(parent, _, { prisma }, _1) {
    return prisma.post.findMany({
      where: {
        published: true,
        author: {
          id: parent.id,
        },
      },
    });
  },
  comments(parent, _, { prisma }, _1) {
    return prisma.comment.findMany({
      where: {
        author: {
          id: parent.id,
        },
      },
    });
  },
};

export default User;
