import { handleRoute } from '@/lib/utils/api-adapter';
import GET_handler from './GET_handler';
import POST_handler from './POST_handler';

export const GET = handleRoute(GET_handler);
export const POST = handleRoute(POST_handler);
