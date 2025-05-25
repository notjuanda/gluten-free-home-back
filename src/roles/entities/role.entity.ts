import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'roles' })
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string;

    @ManyToMany(() => Permission, (perm) => perm.roles, { cascade: true })
    @JoinTable({ name: 'role_permissions' })
    permisos: Permission[];

    @ManyToMany(() => User, (user) => user.roles)
    usuarios: User[];
}
