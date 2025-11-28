export class ServerResponse {
  constructor(
    // la mayor parte del código usa `response.error` (singular) — mantener esa propiedad
    public error: boolean = false,
    public title: string = "",
    public message: string = "",
    public data: any = null
  ) {}
}