"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const akashjs_1 = require("@akashnetwork/akashjs");
console.log('starting...');
const chain = akashjs_1.keplr.getChains().testnet;
const PORT = 8088;
const server = (0, express_1.default)();
server.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signer = yield akashjs_1.keplr.getSigner(chain);
    const accounts = yield signer.getAccounts();
    try {
        const myAddress = accounts[0].address;
        res.json({
            address: myAddress
        });
        // const pems: akashCertificate.pems = await akashCertificate.createCertificate(
        //     myAddress
        // );
        // akashCertificate.broadcastCertificate(
        //     { csr: pems.csr, publicKey: pems.publicKey },
        //     myAddress,
        //     client
        // );
    }
    catch (error) {
        console.log(`Akash Transport : ${error.message}`);
    }
}));
server.listen(PORT, () => {
    console.log('server available on http://localhost:8080');
});
//# sourceMappingURL=index.js.map