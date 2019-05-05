export interface Votes {
    codeParticipant: string;
    codeJuge: string;
    nameJuge: string;
    note: number;
}

export interface Participant {
    name: string;
    lastName: string;
    licence: string;
    votes: Votes[];
    club: string;
    id: string;
}

export const emptyParticipant: Participant = {
    name: '',
    lastName: '',
    licence: '',
    votes: [],
    club: '',
    id: '',
};

export interface Pool {
    participants: Participant[];
}

export interface Categorie {
    contest: string;
    name: string;
    pools: { participants: Participant[] }[];
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

export interface Judge {
    name: string;
    id: string;
    lastName: string;
    mail: string;
    role: string;
    contest: string;
}
