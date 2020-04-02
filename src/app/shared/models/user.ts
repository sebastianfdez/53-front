export class User {
    role: {
        [contestId: string]: string;
    };
    mail: string;
    contest: string[];
    id: string;
    name: string;
    lastName: string;
    autenticated: boolean;
}

export const emptyUser: User = {
    role: {},
    mail: '',
    contest: [],
    id: '',
    name: '',
    lastName: '',
    autenticated: false,
};
