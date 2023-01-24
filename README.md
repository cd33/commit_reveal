# commit_reveal_ecdsa
* Simple implementation of a vote to learn the principle of [Commit-Reveal](https://medium.com/swlh/exploring-commit-reveal-schemes-on-ethereum-c4ff5a777db8) and the principle of [ECDSA](https://medium.com/@ItsCuzzo/using-signatures-ecdsa-for-nft-whitelists-ba0a4d070e92), [other link](https://www.freecodecamp.org/news/how-to-implement-whitelist-in-smartcontracts-erc-721-nft-erc-1155-and-others/)

## Mémo
Pour créer une whitelist avec ECDSA, il faut :
* Avoir la liste des adresses whitelistées
* Transformer ces adresses en signature avec la clé privée du wallet owner (voir signaturesECDSA.js)
* Sur le front, copier le fichier signatures.json généré par le script, puis implémenter un système pour que la signature soit envoyée automatiquement lorsqu'un user whitelisté appelle la fonction commitVote.
* Sur le smart contract, référencer la clé publique du wallet owner, car le principe de ECDSA est qu'avec la signature et le bon wallet (celui du message), ça nous retourne l'adresse publique ayant signée le message (owner).
* Toujours sur le smart contract, hériter de ECDSA, écrire les fonctions nécessaire au bon fonctionnement, puis mettre le require sur la fonction concernée par la whitelist.