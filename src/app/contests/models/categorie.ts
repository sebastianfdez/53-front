export interface Votes {
    codeParticipant: string;
    codeJuge: string;
    nameJuge: string;
    note: number;
}

export interface Participant {
    mail: string;
    name: string;
    lastName: string;
    licence: string;
    votes: Votes[];
    club: string;
    id: string;
    likes: number;
    videoLink: string;
    isUser: boolean;
}

export const emptyParticipant: Participant = {
    mail: '',
    name: '',
    lastName: '',
    licence: '',
    votes: [],
    club: '',
    id: '',
    likes: 0,
    videoLink: '',
    isUser: true,
};

export interface Pool {
    participants: Participant[];
}

export interface Categorie {
    contest: string;
    name: string;
    pools: { participants: Participant[]; }[];
    id: string;
    final: boolean;
}

export const emptyCategorie: Categorie = {
    name: '',
    pools: [],
    id: '',
    contest: '',
    final: false,
};
