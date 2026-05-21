import { handleRoute } from '@/lib/utils/api-adapter';
import GET_handler from './GET_handler';

export const GET = handleRoute(GET_handler);
