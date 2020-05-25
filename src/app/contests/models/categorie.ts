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
    isUser: boolean;
}

export interface ParticipantPublic extends Participant {
    category: string;
    likes: string;
    videoLink: string;
}

export interface PublicVote {
    ips: string[];
}

export const emptyParticipant: Participant = {
    mail: '',
    name: '',
    lastName: '',
    licence: '',
    votes: [],
    club: '',
    id: '',
    isUser: true,
};

export interface Pool {
    participants: Participant[];
}

export interface Categorie {
    contest: string;
    name: string;
    pools: { participants: (Participant | ParticipantPublic)[]; }[];
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
