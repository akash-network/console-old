import fastify from "fastify";
import plugin, { Options } from "./index";

const app = fastify();

describe("testing proxy", () => {
  app.register(plugin, {} as Options);

  test("should return GET response from upstream using uri", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/anything?upstream=https://www.httpbin.org",
    });
    expect(JSON.parse(response.body).headers["Host"]).toBe("www.httpbin.org");
  });

  test("should return GET response from upstream", async () => {
    const response = await app.inject({
      headers: {
        upstream: "https://www.httpbin.org",
      },
      method: "GET",
      url: "/anything",
    });
    expect(JSON.parse(response.body).headers["Host"]).toBe("www.httpbin.org");
  });

  test("should return POST response from upstream", (done) => {
    return app.inject(
      {
        headers: {
          upstream: "https://www.httpbin.org",
        },
        method: "POST",
        url: "/anything",
        payload: {
          hello: "world",
        },
      },
      (err, response) => {
        if (response) {
          expect(JSON.parse(response.body).data).toBe(
            JSON.stringify({ hello: "world" })
          );
        }
        done(err);
      }
    );
  });

  test("should return TLS certificate was presented", (done) => {
    app.inject(
      {
        headers: {
          upstream: "https://certauth.cryptomix.com",
        },
        method: "POST",
        url: "/",
        payload: {
          proxy_cert: `-----BEGIN CERTIFICATE-----
MIIDMTCCAhkCCQCHHb9AAGibzjANBgkqhkiG9w0BAQsFADBUMQswCQYDVQQGEwJV
UzEKMAgGA1UEBwwBQTELMAkGA1UECgwCTkExCzAJBgNVBAsMAk5BMQswCQYDVQQD
DAJOQTESMBAGCSqGSIb3DQEJARYDTk5BMB4XDTIyMDYwNzA3MTUzM1oXDTMyMDYw
NDA3MTUzM1owYTELMAkGA1UEBhMCTkExCzAJBgNVBAgMAk5BMQswCQYDVQQHDAJO
QTELMAkGA1UECgwCTkExCzAJBgNVBAsMAk5BMQswCQYDVQQDDAJOQTERMA8GCSqG
SIb3DQEJARYCTkEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC9hFMX
lx2hfGqycz+QeQS0u+nZ9YcTuANYUPF/zn22xmbWSEVp87rMjLge3dgLIOVKajHM
MjF7F26/Cro1sdn/2hfJQucnXeD2zYEbupN9GUe+NRLmcLJ39zIv+Y8ViQj45r9d
ewOdr1C/5p+5918JVcwInFUDxKNZ0Vv7oym9/0rIV79IBBnIskqc9C5YdOOjkZ5r
qOflxQ2vTESD1sHPa7kyRhjrsxHkHRwttK2peOOsEayMYNbPJujaL3ZK6G9V+QX1
FswBnUiPABzDyMvts/twiFRTKbnmWVbZl+K2CvipNAcyAfGwiE6ymAfkgio3IIxF
v1bAaFLnuCZO30h7AgMBAAEwDQYJKoZIhvcNAQELBQADggEBAGUJvhx2O6y07Tcd
rfpyxHbty7iYpyoGWoIU8d0X8XcIFDf77e6z8ydKrWzjNiBpzzTjKSdk8a4HHI89
0erdPZ31ErvZOjml19TgMUQm1Ks4Bkfl+NKZDfRcRFMON0qQzCKmQOLKR9aIAoOZ
sn/6dyPeqH4kCi03FKJA/FY4lO+LPVX0wtRRFSGIJ68hpC9bFn1O5E1kcwyUePaw
opk47vJg252hSNnI9aYZ6reZxPCTfPrDZDb2Lq+0MX8RWp+FcsB5wlZCtWVmIO3L
4qm3Y1HwtMiuui9yYOllYY+09r3gQ80F39v3KLuxfvsaX/g/IMOfqtIE9CwuYGt2
pZGPQhs=
-----END CERTIFICATE-----`,
          proxy_key: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAvYRTF5cdoXxqsnM/kHkEtLvp2fWHE7gDWFDxf859tsZm1khF
afO6zIy4Ht3YCyDlSmoxzDIxexduvwq6NbHZ/9oXyULnJ13g9s2BG7qTfRlHvjUS
5nCyd/cyL/mPFYkI+Oa/XXsDna9Qv+afufdfCVXMCJxVA8SjWdFb+6Mpvf9KyFe/
SAQZyLJKnPQuWHTjo5Gea6jn5cUNr0xEg9bBz2u5MkYY67MR5B0cLbStqXjjrBGs
jGDWzybo2i92SuhvVfkF9RbMAZ1IjwAcw8jL7bP7cIhUUym55llW2Zfitgr4qTQH
MgHxsIhOspgH5IIqNyCMRb9WwGhS57gmTt9IewIDAQABAoIBAEM4BPTQD51wcLO8
tuX6VpX4NLivImr3EJCpnQ604dgLRPxqA9zRqwbUPpYMH43K7CjZw7Hmd7BuHkS6
fFOBMo5R/6/OAAjxflJrj4iTQ67SYaTwVDTR8iskzXNAs+Ryh3Eo/uUcNasfPKfk
F/Ew8U9xU/4V3P2KKFo6LMLzG2Ic5zMCpgjIylaGmE72GqOCc/NEZPnW7RESd7ct
uQzTqEGQ4CIZ4jceNCj2d3FzdiWtumTPhnA+vV1sP8u8pGahih9Idv9xUQxy0tj7
FEYQHCAJuth0Awk8S1ilAcfwoED0xzLSxP4Hy1rkMKfkFz1d8bR3vE0wf6imSffh
XbRxycECgYEA5nmweInCqFZejVF8X1JzxX7HPbwfjToLiez1EPCxPddRvhKQyNf6
jqf+MTtvIM1Ue4WNZmL5DeTUWaWydrsBlmi5ky6MBivV6P2WHetZk4F2jjsWM2Bf
FwJ0n+o02HGgRqZuXdr9jSUsIoMZIBDaYCwDHM29+ccm7KjyyLhL7eECgYEA0oFn
T8e6lgz8L9uw+J/QBvbUOIHa7e1hBs7kCOSUrlhdoHmhVN4jJk3man2AJ81PFPZh
FZt/136yDUAXXiD3nK/ar6sJ8mhjCl9nfiIvYuNFd6tSIVTFirTA3LjB3zi4cj/O
o6MnORcONGaCUXWoCq+XUfcnbRsyz6wEdt2J6dsCgYEAx99yliZKRPiaCQ5IwNXd
hsG6giRabHyRMyznHqjN3OaVgjPRkgwTw5GW1RVI+3Z2NKUOimN8v3raWWBkU6k7
6Der8CMm1ddALE122T2YMl7M9O3zA90oueisQV64M5jeuUZuYkCfML+y9b8hk/hp
mYuxq1IV1b7LV+PwoPeLCaECgYEAoBOxqZSbyjFzsT0iVd7JxhH7jkEJaDdEunWo
KS8R9YbTJA56ZdxK5H0GxGJNi3bwNWOqrlDCpe/9nF/ppTXyth9wcHfjp4hEEIY+
YEfEuzFTCU6ptRkO44zSwMZq/8HVWWQ2Um/mit6CecyeOy36rK2cp8MII0s0l4Ib
Hv0XPFMCgYBN7DRXyqcqvETNVzJ4xPoGaF/NAAU5u6LnAociYAGy6BYZd7PRpWSh
BMHBmoL9p+d4/nJ3hOI2b9BjyPJqoE+0CIlbiM/f3O7Q1afUjZwS3xTSrQhMVaSL
LPouu6OJpqPcKILIxHqewnhjE9IcYMjyAObecA4KDcfsICglNEaTWw==
-----END RSA PRIVATE KEY-----`,
        },
      },
      (err, response) => {
        if (err) done(err);
        try {
          if (response) {
            expect(response.body).toContain("TLSv1.3 Authentication OK!");
            done();
          }
        } catch (error) {
          done(error);
        }
      }
    );
  });
});
