import swaggerJsdoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'Collaborative Team Hub API',
    version: '1.0.0',
    description:
      'REST API for the Collaborative Team Hub — workspaces, goals, action items, announcements, and more.',
  },
  servers: [{ url: '/api', description: 'API base' }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: { message: { type: 'string' }, code: { type: 'string' } },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          avatarUrl: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Workspace: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          accentColor: { type: 'string', example: '#6366f1' },
          role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          workspaceId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          owner: { $ref: '#/components/schemas/User' },
          milestones: { type: 'array', items: { $ref: '#/components/schemas/Milestone' } },
        },
      },
      Milestone: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          progress: { type: 'integer', minimum: 0, maximum: 100 },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      ActionItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          workspaceId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          position: { type: 'integer' },
          attachments: {
            type: 'array', nullable: true,
            items: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                size: { type: 'integer' },
              },
            },
          },
          assignee: { $ref: '#/components/schemas/User', nullable: true },
          goal: {
            type: 'object', nullable: true,
            properties: { id: { type: 'string' }, title: { type: 'string' } },
          },
        },
      },
      Announcement: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          isPinned: { type: 'boolean' },
          author: { $ref: '#/components/schemas/User' },
          reactions: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['MENTION', 'WORKSPACE_INVITE', 'GOAL_STATUS_CHANGE'] },
          payload: { type: 'object' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    // ── Auth ────────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'name', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string', maxLength: 80 },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registered successfully', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } } } },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged in — sets accessToken + refreshToken cookies' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout — clears cookies', responses: { 204: { description: 'Logged out' } } },
    },
    '/auth/refresh': {
      post: { tags: ['Auth'], summary: 'Refresh access token using refresh cookie', security: [], responses: { 200: { description: 'New access token set in cookie' }, 401: { description: 'Invalid/expired refresh token' } } },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Get current user', responses: { 200: { description: 'Current user', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } } } } } },
    },
    '/auth/profile': {
      patch: {
        tags: ['Auth'],
        summary: 'Update name / avatarUrl',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, avatarUrl: { type: 'string' } } } } } },
        responses: { 200: { description: 'Updated user' } },
      },
    },
    '/auth/avatar': {
      post: {
        tags: ['Auth'],
        summary: 'Upload avatar (image, max 4MB) → Cloudinary',
        requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } } } } },
        responses: { 200: { description: 'Returns avatarUrl' } },
      },
    },

    // ── Upload ──────────────────────────────────────────────────────────────
    '/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Upload any file (max 10MB) → Cloudinary. Returns url, name, type, size.',
        requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } },
        responses: {
          200: { description: 'Upload result', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { url: { type: 'string' }, name: { type: 'string' }, type: { type: 'string' }, size: { type: 'integer' } } } } } } } },
        },
      },
    },

    // ── Workspaces ──────────────────────────────────────────────────────────
    '/workspaces': {
      get: { tags: ['Workspaces'], summary: 'List workspaces for current user', responses: { 200: { description: 'Array of workspaces' } } },
      post: {
        tags: ['Workspaces'],
        summary: 'Create workspace',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' }, accentColor: { type: 'string' } } } } } },
        responses: { 201: { description: 'Created workspace' } },
      },
    },
    '/workspaces/{workspaceId}': {
      get: { tags: ['Workspaces'], summary: 'Get workspace detail + members', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Workspace' } } },
      patch: { tags: ['Workspaces'], summary: 'Update workspace (admin only)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated workspace' } } },
      delete: { tags: ['Workspaces'], summary: 'Delete workspace (admin only)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
    },
    '/workspaces/{workspaceId}/members': {
      post: { tags: ['Workspaces'], summary: 'Invite member by email', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string', enum: ['ADMIN', 'MEMBER'] } } } } } }, responses: { 201: { description: 'Member added' } } },
    },
    '/workspaces/{workspaceId}/members/{userId}': {
      patch: { tags: ['Workspaces'], summary: 'Change member role (admin)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Workspaces'], summary: 'Remove member or leave', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Removed' } } },
    },

    // ── Goals ───────────────────────────────────────────────────────────────
    '/workspaces/{workspaceId}/goals': {
      get: {
        tags: ['Goals'],
        summary: 'List goals',
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] } },
          { name: 'ownerId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Goals array' } },
      },
      post: {
        tags: ['Goals'],
        summary: 'Create goal',
        parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title'], properties: { title: { type: 'string' }, description: { type: 'string' }, ownerId: { type: 'string' }, dueDate: { type: 'string', format: 'date-time' }, status: { type: 'string' } } } } } },
        responses: { 201: { description: 'Created goal', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { goal: { $ref: '#/components/schemas/Goal' } } } } } } } } },
      },
    },
    '/workspaces/{workspaceId}/goals/{goalId}': {
      get: { tags: ['Goals'], summary: 'Get goal detail (milestones + updates)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Goal' } } },
      patch: { tags: ['Goals'], summary: 'Update goal', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated goal' } } },
      delete: { tags: ['Goals'], summary: 'Delete goal (admin)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
    },
    '/workspaces/{workspaceId}/goals/{goalId}/milestones': {
      post: { tags: ['Goals'], summary: 'Add milestone', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['title'], properties: { title: { type: 'string' }, progress: { type: 'integer' }, dueDate: { type: 'string' } } } } } }, responses: { 201: { description: 'Milestone created' } } },
    },
    '/workspaces/{workspaceId}/goals/{goalId}/milestones/{milestoneId}': {
      patch: { tags: ['Goals'], summary: 'Update milestone progress', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'milestoneId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Goals'], summary: 'Delete milestone', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'milestoneId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
    },
    '/workspaces/{workspaceId}/goals/{goalId}/updates': {
      get: { tags: ['Goals'], summary: 'List goal activity updates', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updates array' } } },
      post: { tags: ['Goals'], summary: 'Post a goal update', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'goalId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['body'], properties: { body: { type: 'string' } } } } } }, responses: { 201: { description: 'Update posted' } } },
    },

    // ── Action Items ────────────────────────────────────────────────────────
    '/workspaces/{workspaceId}/action-items': {
      get: {
        tags: ['Action Items'],
        summary: 'List action items',
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'assigneeId', in: 'query', description: '"all" for all members, omit for current user', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
          { name: 'goalId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Items array', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ActionItem' } } } } } } } },
      },
      post: {
        tags: ['Action Items'],
        summary: 'Create action item',
        parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title'], properties: { title: { type: 'string' }, description: { type: 'string' }, assigneeId: { type: 'string' }, priority: { type: 'string' }, status: { type: 'string' }, dueDate: { type: 'string' }, goalId: { type: 'string' }, attachments: { type: 'array', items: { type: 'object' } } } } } } },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/workspaces/{workspaceId}/action-items/reorder': {
      patch: { tags: ['Action Items'], summary: 'Batch reorder (drag-and-drop)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' }, position: { type: 'integer' } } } } } } } } }, responses: { 200: { description: 'OK' } } },
    },
    '/workspaces/{workspaceId}/action-items/{itemId}': {
      patch: { tags: ['Action Items'], summary: 'Update action item', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Action Items'], summary: 'Delete action item (admin)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
    },

    // ── Announcements ───────────────────────────────────────────────────────
    '/workspaces/{workspaceId}/announcements': {
      get: { tags: ['Announcements'], summary: 'List announcements', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Announcements array' } } },
      post: { tags: ['Announcements'], summary: 'Create announcement (admin)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Created' } } },
    },
    '/workspaces/{workspaceId}/announcements/{announcementId}': {
      patch: { tags: ['Announcements'], summary: 'Edit / pin announcement', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'announcementId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Announcements'], summary: 'Delete announcement (admin)', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'announcementId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
    },
    '/workspaces/{workspaceId}/announcements/{announcementId}/reactions': {
      post: { tags: ['Announcements'], summary: 'Toggle emoji reaction', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'announcementId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { emoji: { type: 'string' } } } } } }, responses: { 200: { description: 'Reaction toggled' } } },
    },
    '/workspaces/{workspaceId}/announcements/{announcementId}/comments': {
      post: { tags: ['Announcements'], summary: 'Post comment', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'announcementId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Comment posted' } } },
    },

    // ── Analytics ───────────────────────────────────────────────────────────
    '/workspaces/{workspaceId}/analytics': {
      get: { tags: ['Analytics'], summary: 'Workspace analytics summary', parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Analytics data' } } },
    },

    // ── Audit Log ───────────────────────────────────────────────────────────
    '/workspaces/{workspaceId}/audit-log': {
      get: {
        tags: ['Audit Log'],
        summary: 'Paginated audit log (admin)',
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Audit entries' } },
      },
    },

    // ── Notifications ───────────────────────────────────────────────────────
    '/notifications': {
      get: { tags: ['Notifications'], summary: 'List notifications for current user', responses: { 200: { description: 'Notifications array' } } },
    },
    '/notifications/read-all': {
      patch: { tags: ['Notifications'], summary: 'Mark all as read', responses: { 200: { description: 'Updated' } } },
    },
    '/notifications/{id}/read': {
      patch: { tags: ['Notifications'], summary: 'Mark one notification as read', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({ definition, apis: [] });
