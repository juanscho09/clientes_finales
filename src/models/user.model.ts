// ...existing code...
export class User {
  constructor(
    public id: number = 0,
    public name: string | null = null,
    public username: string | null = null,
    public password: string | null = null,
    public cuit: string | null = null,
    public nroDoc: string | null = null
  ) {}

  public static create(object: any): User {
    const user = new User();
    if (!object) return user;

    // El backend puede usar claves con acentos o distintas mayúsculas
    user.id = object?.Cliente ?? object?.cliente ?? 0;
    user.name = object?.Nombre ?? object?.nombre ?? null;
    user.username = object?.Usuario ?? object?.usuario ?? null;
    // Contraseña puede venir con acento o sin, o con Password
    user.password = object?.Contraseña ?? object?.Contrasena ?? object?.contrasena ?? object?.Password ?? object?.password ?? null;
    user.cuit = object?.CUIT ?? object?.cuit ?? null;
    user.nroDoc = object?.NroDoc ?? object?.nroDoc ?? object?.documento ?? null;

    return user;
  }
}