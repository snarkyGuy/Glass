export const ipfsToUrl = (ipfsUrl: string) => {
    const hash = ipfsUrl.split("://")[1];
    return `https://ipfs.io/ipfs/${hash}`;
  };