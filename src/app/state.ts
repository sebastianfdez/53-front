import { User } from './shared/models/user';
import { Contest } from './shared/models/contest';

export interface State {
    user: User;
    selectedContest: Contest;
    judges: User[];
    speaker: User;
    contests: {
        [id: string]: Contest;
    };
    [key: string]: any;
}
