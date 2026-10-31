// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { once } from "node:events";
import { test,expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { bothPrograms,eventually } from "../../server/test/support/both-programs.ts";
import { physicsReference } from "../../server/test/support/doi-fixtures.ts";
let both:Awaited<ReturnType<typeof bothPrograms>>,vite:ChildProcess;
const url="http://127.0.0.1:5274";
test.beforeAll(async()=>{
 both=await bothPrograms({accounts:true});
 both.serviceConfig.allowedOrigins=[url,"https://web.test.invalid"];
 await writeFile(both.serviceConfigPath,JSON.stringify(both.serviceConfig));await both.restartService();
 vite=spawn(process.execPath,[new URL("../node_modules/vite/bin/vite.js",import.meta.url).pathname,"--host","127.0.0.1","--port","5274","--strictPort"],{cwd:new URL("..",import.meta.url),env:{PATH:process.env.PATH,NODE_ENV:"test",SOURCE_TASTER_API_URL:both.apiUrl,VITE_SOURCE_TASTER_MODE:"hosted",VITE_SOURCE_TASTER_SERVICE_URL:both.serviceUrl},stdio:["ignore","pipe","pipe"]});
 let output="";vite.stderr!.on("data",b=>{output+=String(b)});
 await eventually(async()=>{if(vite.exitCode!==null)throw new Error(output);return fetch(url).then(r=>r.ok,()=>false);});
});
test.afterAll(async()=>{if(vite&&vite.exitCode===null){const exited=once(vite,"exit");vite.kill("SIGTERM");await exited;}await both?.stop();});
for(const language of ["en","de"] as const)test(`email-code sign-in, keyboard confirmation, restart and logout in ${language}`,async({browser})=>{
 const context=await browser.newContext({locale:language});const page=await context.newPage();
 try{
 await page.goto(url);
 await expect(page.getByText(language==="de"?"Gast-Prüfungen und Gast-Kontingent werden bei der Registrierung nicht übertragen.":"Guest Checks and Guest Quota are not transferred when you register.")).toBeVisible();
 await page.getByRole("button",{name:language==="de"?"Anmelden":"Sign in",exact:true}).click();
 await page.getByLabel(language==="de"?"E-Mail-Adresse":"Email address",{exact:true}).fill(`browser-${language}@example.invalid`);
 await page.getByRole("button",{name:language==="de"?"Code senden":"Send code",exact:true}).click();
 const label=language==="de"?"Sechsstelliger Code":"Six-digit code";
 await expect(page.getByLabel(label)).toBeVisible();
 const mail=(await both.mail()).at(-1)!;
 expect(mail.subject).toBe(language==="de"?"Dein Anmeldecode für Source Taster":"Your Source Taster sign-in code");
 const code=mail.text.match(/\b[0-9]{6}\b/)![0];
 await page.getByLabel(label).fill(code);await page.getByLabel(label).press("Enter");
 await expect(page.getByText(`browser-${language}@example.invalid`,{exact:true})).toBeVisible();
 const states=await context.storageState();expect(JSON.stringify(states.origins)).not.toMatch(/accessToken|eyJ|__Host-st-session/);
 expect(states.cookies.find(c=>c.name==="__Host-st-session")).toMatchObject({secure:true,httpOnly:true,sameSite:"Strict"});
 await page.reload();await expect(page.getByText(`browser-${language}@example.invalid`,{exact:true})).toBeVisible();
 const tokens:string[]=[];page.on("request",request=>{const value=request.headers()["authorization"];if(value)tokens.push(value);});
 await page.locator("textarea").fill(physicsReference);
 await page.getByRole("button",{name:language==="de"?"Referenz prüfen":"Check Reference",exact:true}).click();
 await expect(page.locator("#results-title")).toBeVisible();
 expect(tokens.some(token=>JSON.parse(Buffer.from(token.split(".")[1]!,"base64url").toString()).purpose==="account-access")).toBe(true);
 expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze()).violations).toEqual([]);
 await page.getByRole("button",{name:language==="de"?"Überall abmelden":"Sign out everywhere",exact:true}).click();
 await expect(page.getByRole("button",{name:language==="de"?"Anmelden":"Sign in",exact:true})).toBeVisible();
 await expect(page.locator("#results-title")).toHaveCount(0);
 }finally{await context.close();}
});
