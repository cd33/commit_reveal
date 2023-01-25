import { expect } from "chai";
import { ethers } from "hardhat";
import { CommitReveal } from "../typechain-types/contracts";

describe("CommitReveal", function () {
  let contract: CommitReveal;

  function addDays(days: number) {
    return days * 24 * 60 * 60;
  }

  const signerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const signatureOwner =
    "0x0cb5f2707779110c28efda5e2851758a6efaf578ac497b5ea346a622523bd3781d2e53642fada98a44b46ed9eb2a47a296751737df7deea330d3cb05836f00721b";
  const signatureInvestor =
    "0x67c4cae9be5b1efc968ab6be55caadb5a9eee7089ca2a261c4af1513d4a641a733f70b118f6acd01353d17e7252fb15ce02ca537cae517c60efe9570d12a87b11b";

  beforeEach(async function () {
    [this.owner, this.investor, this.toto] = await ethers.getSigners(); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    const CommitReveal = await ethers.getContractFactory("CommitReveal");
    contract = await CommitReveal.deploy(signerAddress);
    await contract.deployed();
  });

  describe("Steps", function () {
    it("SetStep setStep() Changements de steps step()", async function () {
      let step = await contract.step();
      expect(step).to.equal(0);
      await contract.setStep();
      step = await contract.step();
      expect(step).to.equal(1);
      await contract.setStep();
      step = await contract.step();
      expect(step).to.equal(2);
      await expect(contract.setStep()).to.be.revertedWith("Vote done");
    });

    it("REVERT: setStep() Not Owner", async function () {
      await expect(
        contract.connect(this.investor).setStep()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Déroulement Complet", function () {
    it("Test Commit Reveal", async function () {
      const hashOwner = await contract.getHash("toto", "salt");
      const hashInvestor = await contract
        .connect(this.investor)
        .getHash("tata", "yo");
      const hashToto = await contract
        .connect(this.toto)
        .getHash("tata", "pass");

      let voteOwner = await contract.voteByUser(this.owner.address);
      expect(voteOwner).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );

      let voteInvestor = await contract
        .connect(this.investor)
        .voteByUser(this.investor.address);
      expect(voteInvestor).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );

      await contract.commitVote(hashOwner, signatureOwner);
      await contract
        .connect(this.investor)
        .commitVote(hashInvestor, signatureInvestor);
      await expect(
        contract.connect(this.toto).commitVote(hashToto, signatureOwner)
      ).to.be.revertedWith("Signature Validation Failed");

      voteOwner = await contract.voteByUser(this.owner.address);
      expect(voteOwner).to.equal(hashOwner);
      voteInvestor = await contract
        .connect(this.investor)
        .voteByUser(this.investor.address);
      expect(voteInvestor).to.equal(hashInvestor);

      await expect(contract.revealVote("toto", "salt")).to.be.revertedWith(
        "Reveal period done"
      );
      await expect(
        contract.connect(this.investor).revealVote("tata", "yo")
      ).to.be.revertedWith("Reveal period done");

      await contract.setStep();

      await expect(contract.revealVote("tutu", "pass")).to.be.revertedWith(
        "Wrong Vote & Salt"
      );

      await contract.revealVote("toto", "salt");
      await contract.connect(this.investor).revealVote("tata", "yo");

      await expect(contract.getVotes("toto")).to.be.revertedWith(
        "Wait results period"
      );

      await contract.setStep();

      const nbVoteToto = await contract.getVotes("toto");
      const nbVoteTata = await contract.getVotes("toto");
      expect(nbVoteToto).to.equal(1);
      expect(nbVoteTata).to.equal(1);

      voteOwner = await contract.voteByUser(this.owner.address);
      expect(voteOwner).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      voteInvestor = await contract
        .connect(this.investor)
        .voteByUser(this.investor.address);
      expect(voteInvestor).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    });

    it("Test Commit Reveal with Timestamps", async function () {
      const hash = await contract.getHash("toto", "salt");

      let vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );

      await contract.commitVote(hash, signatureOwner);

      vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal(hash);

      await expect(contract.revealVote("toto", "salt")).to.be.revertedWith(
        "Reveal period done"
      );

      const { timestamp } = await ethers.provider.getBlock("latest");
      await ethers.provider.send("evm_mine", [
        parseInt(ethers.BigNumber.from(timestamp).add(addDays(1)).toString()),
      ]);

      await expect(contract.revealVote("tutu", "pass")).to.be.revertedWith(
        "Wrong Vote & Salt"
      );

      await contract.revealVote("toto", "salt");

      await expect(contract.getVotes("toto")).to.be.revertedWith(
        "Wait results period"
      );

      await contract.setStep();

      await ethers.provider.send("evm_mine", [
        parseInt(ethers.BigNumber.from(timestamp).add(addDays(3)).toString()),
      ]);

      const nbVote = await contract.getVotes("toto");
      expect(nbVote).to.equal(1);

      vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    });
  });
});
