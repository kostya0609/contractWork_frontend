import {SearchRepository} from "./SearchRepository";
import {ContractRepository} from "./ContractRepository";
import {FilesRepository} from "./FilesRepository";
import {ActionsRepository} from "./ActionsRepository";
import {LawyerRepository} from "./LawyerRepository"
import {ProtocolsRepository} from "./ProtocolsRepository"
import {LogsRepository} from "./LogsRepository"
import {ProcessRepository} from "./ProcessRepository"
import {ScansRepository} from "./ScansRepository"
import {RolesRepository} from "./RolesRepository"
import {UsersRepository} from "./UsersRepository"
import {GridRepository} from "./GridRepository"

export const SearchRepo          = new SearchRepository();
export const ContractRepo        = new ContractRepository();
export const FilesRepo           = new FilesRepository();
export const ActionsRepo         = new ActionsRepository();
export const LawyerRepo          = new LawyerRepository();
export const ProtocolsRepo       = new ProtocolsRepository();
export const LogsRepo            = new LogsRepository();
export const ProcessRepo         = new ProcessRepository();
export const ScansRepo           = new ScansRepository();
export const RolesRepo           = new RolesRepository();
export const UsersRepo           = new UsersRepository();
export const GridRepo            = new GridRepository();
