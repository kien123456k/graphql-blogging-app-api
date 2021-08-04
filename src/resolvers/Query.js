import getUserId from "../utils/getUserId";

const Query = {
  users(_, args, { prisma }, _1) {
    const opArgs = {
      skip: args.skip,
      take: args.take,
      orderBy: args.orderBy,
    };

    if (args.query) {
      opArgs.where = {
        OR: [
          {
            name_contains: args.query,
          },
        ],
      };
    }

    return prisma.user.findMany(opArgs);
  },
  me(_, _1, { prisma, request }, _2) {
    const userId = getUserId(request);

    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  },
  posts(_, args, { prisma }, _1) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        published: true,
      },
    };

    if (args.query) {
      opArgs.where.OR = [
        {
          title_contains: args.query,
        },
        {
          body_contains: args.query,
        },
      ];
    }

    return prisma.post.findMany(opArgs);
  },
  async myPosts(_, args, { prisma, request }, _1) {
    const userId = getUserId(request);
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        author: {
          id: userId,
        },
      },
    };

    if (args.query) {
      opArgs.where.OR = [
        {
          title_contains: args.query,
        },
        {
          body_contains: args.query,
        },
      ];
    }

    return prisma.post.findMany(opArgs);
  },
  async post(_, args, { prisma, request }, _1) {
    const userId = getUserId(request, false);

    const post = await prisma.post.findFirst({
      where: {
        id: args.id,
        OR: [{ published: true }, { author: { id: userId } }],
      },
    });

    if (post) {
      throw new Error("Post not found!");
    }

    return post;
  },
  comments(_, args, { prisma }, _1) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    };

    return prisma.comment.findMany(opArgs);
  },
};

export default Query;
