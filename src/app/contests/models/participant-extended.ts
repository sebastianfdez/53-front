import { Participant } from './categorie';

export interface ParticipantExtended extends Participant {
    pool: string;

    name: string;

    participantName: string;

    participantLastName: string;

    average: string;

    calification: string;

    [idJudge: string]: string;
}
