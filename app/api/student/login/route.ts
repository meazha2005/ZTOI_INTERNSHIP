import { handleRoute } from '@/lib/utils/api-adapter';
import POST_handler from './POST_handler';

export const POST = handleRoute(POST_handler);
