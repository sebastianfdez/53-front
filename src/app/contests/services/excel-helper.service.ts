/* eslint-disable class-methods-use-this */
import { Injectable } from '@angular/core';
import { UploadEvent } from '@progress/kendo-angular-upload';
import * as XLSX from 'xlsx';
import { WarningService } from 'src/app/shared/warning/warning.service';
import { Categorie } from '../models/categorie';

@Injectable()
export class ExcelHelperService {
    constructor(private warningService: WarningService) {}

    /**
     * Receive the upload event and return the categorie object.
     * @param event {UploadEvent} Event containing the excel File
     * @param callBack {void} Function called when the upload is finish
     */
    uploadFile(event: UploadEvent, callBack: (event_: ProgressEvent<FileReader>) => void): void {
        event.preventDefault();
        const excelFile: File = event.files[0].rawFile;
        // eslint-disable-next-line no-undef
        const fr: FileReader = new FileReader();
        fr.onload = (event_) => callBack(event_);
        fr.readAsBinaryString(excelFile);
    }

    /**
     * Load file and return the compiled categorie
     * @param event {ProgressEvent<FileReader>} Event containing the excel File
     * @param playersByPool {number} Number of participants in every pool
     * @param categorie {Categorie} Reference to the actual Categorie
     * @returns {Categorie} Compiled categorie
     */
    loadFile(
        event_: ProgressEvent<FileReader>, playersByPool: number, categorie: Categorie,
    ): Categorie {
        const categorie_: Categorie = categorie;
        const bstr: ArrayBuffer = ((event_.target as FileReader).result) as ArrayBuffer;
        const datas = new Uint8Array(bstr);
        const arr = [];
        datas.forEach((data) => arr.push(String.fromCharCode(data)));
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstsheetname = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstsheetname];
        // Create json list of players from excel
        const players: {
            nom: string;
            prenom: string;
            club: string;
            licence: string;
        }[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        // Check the columns are well defined
        if (!players[0].nom || !players[0].prenom || !players[0].club || !players[0].licence) {
            let error = 'Erreur: Il manque les colonnes suivantes: ';
            error += !players[0].nom ? 'nom, ' : '';
            error += !players[0].prenom ? 'prenom, ' : '';
            error += !players[0].club ? 'club, ' : '';
            if (!players[0].licence) {
                error += 'licence';
            } else {
                error.slice(0, error.length - 3);
            }
            this.warningService.showWarning(error, false);
            return null;
        }
        // If there is any pool already created, make the first one
        if (!categorie_.pools.length) {
            categorie_.pools.push({ participants: [] });
        }
        // Sort randomly the players
        players.sort(() => 0.5 - Math.random());
        players.forEach((player) => {
            if (categorie_.pools[categorie_.pools.length - 1]
                .participants.length < playersByPool) {
                categorie_.pools[categorie_.pools.length - 1].participants.push({
                    id: `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000)}`,
                    votes: [],
                    club: player.club,
                    lastName: player.nom,
                    name: player.prenom,
                    licence: player.licence,
                    likes: 0,
                    mail: '',
                    videoLink: '',
                    isUser: false,
                });
            } else {
                categorie_.pools.push({
                    participants: [{
                        id: `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000)}`,
                        votes: [],
                        club: player.club,
                        lastName: player.nom,
                        name: player.prenom,
                        licence: player.licence,
                        likes: 0,
                        mail: '',
                        videoLink: '',
                        isUser: false,
                    }],
                });
            }
        });
        return categorie_;
    }
}
