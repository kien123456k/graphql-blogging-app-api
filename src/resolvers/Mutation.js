import bcrypt from "bcrypt";
import getUserId from "../utils/getUserId";
import generateToken from "../utils/generateToken";
import hashPassword from "../utils/hashPassword";

const Mutation = {
  async createUser(_, args, { prisma }, _1) {
    const userExists = await prisma.user.findUnique({
      where: {
        email: args.data.email,
      },
    });

    if (userExists) {
      throw new Error("User email is taken!");
    }

    const password = await hashPassword(args.data.password);

    const user = await prisma.user.create({
      data: { ...args.data, password },
    });

    return {
      user,
      token: generateToken(user.id),
    };
  },
  async login(_, args, { prisma }, _1) {
    const user = await prisma.user.findUnique({
      where: {
        email: args.data.email,
      },
    });

    if (!user) {
      throw new Error("User is not exist!");
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password!");
    }

    return {
      user,
      token: generateToken(user.id),
    };
  },
  async updateUser(_, args, { prisma, request }, _1) {
    const userId = getUserId(request);

    if (typeof args.data.password === "string") {
      args.data.password = await hashPassword(args.data.password);
    }

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: args.data,
    });
  },
  async deleteUser(_, _1, { prisma, request }, _2) {
    const userId = getUserId(request);

    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  },
  async createPost(_, args, { prisma, request, pubsub }, _1) {
    const userId = getUserId(request);

    const post = await prisma.post.create({
      data: {
        title: args.data.title,
        body: args.data.body,
        published: args.data.published,
        author: {
          connect: {
            id: userId,
          },
        },
      },
    });

    pubsub.publish("post", {
      post: {
        mutation: "CREATED",
        node: post,
      },
    });

    return post;
  },
  async updatePost(_, args, { prisma, request, pubsub }, _1) {
    const userId = getUserId(request);
    const postExists = await prisma.post.findFirst({
      where: {
        id: args.id,
        author: {
          id: userId,
        },
      },
    });
    const isPublished = await prisma.post.findFirst({
      where: {
        id: args.id,
        published: true,
      },
    });

    if (!postExists) {
      throw new Error("Post not found!");
    }

    const post = await prisma.post.update({
      where: {
        id: args.id,
      },
      data: args.data,
    });

    if (isPublished && args.data.published === false) {
      await prisma.comment.deleteMany({
        where: {
          post: {
            id: args.id,
          },
        },
      });

      pubsub.publish("post", {
        post: {
          mutation: "DELETED",
          data: isPublished,
        },
      });
    } else if (!isPublished && args.data.published === true) {
      pubsub.publish("post", {
        post: {
          mutation: "CREATED",
          data: post,
        },
      });
    }

    return post;
  },
  async deletePost(_, args, { prisma, request }, _1) {
    const userId = getUserId(request);
    const postExists = await prisma.post.findFirst({
      where: {
        id: args.id,
        author: {
          id: userId,
        },
      },
    });

    if (!postExists) {
      throw new Error("post not found!");
    }

    const post = await prisma.post.delete({
      where: {
        id: args.id,
      },
    });

    if (post.published) {
      pubsub.publish("post", {
        post: {
          mutation: "DELETED",
          node: post,
        },
      });
    }

    return post;
  },
  async createComment(_, args, { prisma, request, pubsub }, _1) {
    const userId = getUserId(request);
    const postExists = await prisma.post.findFirst({
      where: {
        id: args.data.post,
        published: true,
      },
    });

    if (!postExists) {
      throw new Error("Post not found!");
    }

    const comment = await prisma.comment.create({
      data: {
        text: args.data.text,
        author: {
          connect: {
            id: userId,
          },
        },
        post: {
          connect: {
            id: args.data.post,
          },
        },
      },
    });

    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: "CREATED",
        data: comment,
      },
    });

    return comment;
  },
  async updateComment(_, args, { prisma, request, pubsub }, _1) {
    const userId = getUserId(request);
    const commentExists = await prisma.comment.findFirst({
      where: {
        id: args.id,
        author: {
          id: userId,
        },
      },
    });

    if (!commentExists) {
      throw new Error("Comment not found!");
    }

    const comment = await prisma.comment.update({
      where: {
        id: args.id,
      },
      data: args.data,
    });

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: "UPDATED",
        data: comment,
      },
    });

    return comment;
  },
  async deleteComment(_, args, { prisma, request, pubsub }, _1) {
    const userId = getUserId(request);
    const commentExists = await prisma.comment.findFirst({
      where: {
        id: args.id,
        author: {
          id: userId,
        },
      },
    });

    if (!commentExists) {
      throw new Error("Comment not found!");
    }

    const comment = await prisma.comment.delete({
      where: {
        id: args.id,
      },
    });

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: "DELETED",
        data: comment,
      },
    });

    return comment;
  },
};

export default Mutation;
