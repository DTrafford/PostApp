import { Reply } from './reply.model';

export interface Post {
    id: string;
    title: string;
    content: string;
    creatorId: string;
    creatorName: string;
    replies: Reply[];
    imagePath: string;
}
