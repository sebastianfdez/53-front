import { User } from './shared/models/user';
import { Contest } from './shared/models/contest';
import { Judge } from './contests/models/categorie';

export interface State {
    user: User;
    contest: Contest;
    judges: Judge[];
    [key: string]: any;
}
