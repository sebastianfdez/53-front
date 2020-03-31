import { User } from './shared/models/user';
import { Contest } from './shared/models/contest';
import { Judge } from './contests/models/categorie';
import { Speaker } from './contests/models/speaker';

export interface State {
    user: User;
    selectedContest: Contest;
    judges: Judge[];
    speaker: Speaker;
    contests: {
        [id: string]: Contest;
    };
    [key: string]: any;
}
