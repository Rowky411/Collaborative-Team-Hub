import { prisma } from '../lib/prisma.js';
import { forbidden, notFound } from '../lib/errors.js';

export function requireWorkspaceMember(role) {
  return async function (req, _res, next) {
    try {
      const workspaceId = req.params.workspaceId;
      if (!workspaceId) return next(notFound('Workspace not found'));

      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId: req.user.id },
        },
      });

      if (!member) return next(forbidden('Not a member of this workspace'));
      if (role && member.role !== role) {
        return next(forbidden(`${role} role required`));
      }

      req.workspaceMember = member;
      next();
    } catch (err) {
      next(err);
    }
  };
}
