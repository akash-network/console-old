export async function pendo(dseq: number, action: string, optedIn: boolean) {
  try {
    if (!optedIn) return;
    if ((window as any).pendo) {
      const key = await (window as any).keplr.getKey('akashnet-2');
      (window as any).pendo.initialize({
        visitor: {
          id: key.bech32Address,
          wallet_name: key.name,
          dseq,
          action,
        },
        account: {
          id: key.bech32Address,
          wallet_name: key.name,
          dseq,
          action,
        },
      });
    }
  } catch (error: any) {
    throw new Error(`Error: Pendo | ${error.message}`);
  }
}
