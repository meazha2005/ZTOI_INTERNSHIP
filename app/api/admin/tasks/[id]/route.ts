import { handleRoute } from '@/lib/utils/api-adapter';
import DELETE_handler from './DELETE_handler';
import PUT_handler from './PUT_handler';

export const DELETE = handleRoute(DELETE_handler);
export const PUT = handleRoute(PUT_handler);
