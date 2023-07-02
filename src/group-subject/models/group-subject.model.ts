import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
} from 'sequelize-typescript';
import { Group } from '../../group/models/group.model';
import { Subject } from '../../subject/models/subject.model';

interface GroupSubjectAttrs {
  id: string;
  group_id: string;
  subject_id: string;
}

@Table({ tableName: 'group_subject' })
export class GroupSubject extends Model<GroupSubject, GroupSubjectAttrs> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.STRING,
  })
  group_id: string;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.STRING,
  })
  subject_id: string;

  @BelongsTo(() => Group)
  group: Group;

  @BelongsTo(() => Subject)
  subject: Subject;
}
