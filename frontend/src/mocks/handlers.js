import { http, HttpResponse } from "msw";
import config from "../apis/config";

export const handlers = [
  http.post(`${config.BASE_API_URL}/users/sign-up`, async (info) => {
    const { username } = await info.request.json();
    if (username === "errorUser") {
      //   return res(ctx.status(400), ctx.json({ error: "Username taken" }));
      return HttpResponse.json({ error: "Username taken" }, { status: 400 });
    }
    // return res(ctx.status(200), ctx.json({ token: "mocked-token" }));
    return HttpResponse.json({ token: "mocked-token" }, { status: 200 });
  }),
];
