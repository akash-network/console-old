# mtls-proxy

This proxy server seamlessly accepts client certificates and keys to forward upstream.

## why?

In secure environments such as browsers, self signed certificates are not honored to ensure that certificate authorities are vetted and thus ideally those using certificates are subject to some form of regulation.

However with-in self managed `mTLS` environments, self signed certificates make much sense to validate the client application's commands are under control of the client party and not snarfed by a `mitm`. The ability to generate `x509` certificates through `Subtle.crypto` means the progression of continued security at the user custody level.

This server allows that communication to easily facilitate. Using natural `proxy forwarding` requests can use a traditional proxy model, supported by libraries like `Axios`, `curl` and others.

### how to use

Send a request to your server as you would to the original upstream. Specify `proxy_cert` and `proxy_key` in the post body.

bash using `curl`

```bash
curl --proxy "http://localhost:3000" "http://www.httpbin.org/ip"
```

or to make a secure request over the insecure proxy

```bash
curl --proxy-insecure "http://localhost:3000" "https://www.google.com"
```

typescript using the `axios` library

```typescript
import axios from "axios";

axios
    .post("http://localhost:3000/ip", {
        headers: {
            host: "http://www.httpbin.org/",
        },
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
```

If you can not modify the headers, and can only modify the host of the platform you are trying to proxy through, using a `query string` parameter is available.

```bash
curl "http://localhost:3000/ip?upstream=http://httpbin.org/ip"
curl "http://localhost:3000/ip?upstream=https://www.httpbin.org"
```

Sending `mTLS` connection information along with the upstream request.

```javascript
import axios from "axios";

axios
    .post(
        "http://localhost:3000/",
        {
            proxy_key: "",
            proxy_cert: "",
        },
        {
            headers: {
                host: "https://certauth.cryptomix.com",
            },
        }
    )
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
```

### how pathing works

When using a requesting a resource, the pathing should be requested from the proxy.

Example a resource that is available at `http://foo.com/my-resource` would be requested as `http://proxy.com/my-resource?upstream=http://foo.com/my-resource`

### advanced configuration

using the `Options` type, you can define

### thanks

to the original work by all the contributors to the original modules.
