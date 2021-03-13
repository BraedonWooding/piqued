export interface Group {
    name: string,
    id: number,
}

export interface User {
    date_of_birth: string;
    profile_picture: string | null;
    username: string;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    interests: any[];
    courses: any[];
    program: string | null;
    groups: Group[];
}
