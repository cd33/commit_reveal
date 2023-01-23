import { expect } from "chai";
import { ethers } from "hardhat";
import { CommitReveal } from "../typechain-types/contracts";

describe("CommitReveal", function () {
  let contract: CommitReveal;

  function addDays(days: number) {
    return days * 24 * 60 * 60;
  }

  beforeEach(async function () {
    [this.owner, this.investor] = await ethers.getSigners(); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    const CommitReveal = await ethers.getContractFactory("CommitReveal");
    contract = await CommitReveal.deploy();
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
      const hash = await contract.getHash("toto", "salt");

      let vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");

      await contract.commitVote(hash);

      vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal(hash);

      await expect(contract.revealVote("toto", "salt")).to.be.revertedWith("Reveal period done");

      await contract.setStep();

      await expect(contract.revealVote("tutu", "pass")).to.be.revertedWith("Wrong Vote & Salt");

      await contract.revealVote("toto", "salt");

      await expect(contract.getVotes("toto")).to.be.revertedWith("Wait results period");

      await contract.setStep();

      const nbVote = await contract.getVotes("toto")
      expect(nbVote).to.equal(1);

      vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    it("Test Commit Reveal with Timestamps", async function () {
      const hash = await contract.getHash("toto", "salt");

      let vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");

      await contract.commitVote(hash);

      vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal(hash);

      await expect(contract.revealVote("toto", "salt")).to.be.revertedWith("Reveal period done");

      const { timestamp } = await ethers.provider.getBlock("latest");
      await ethers.provider.send("evm_mine", [
        parseInt(ethers.BigNumber.from(timestamp).add(addDays(1)).toString()),
      ]);

      await expect(contract.revealVote("tutu", "pass")).to.be.revertedWith("Wrong Vote & Salt");

      await contract.revealVote("toto", "salt");

      await expect(contract.getVotes("toto")).to.be.revertedWith("Wait results period");
      
      await contract.setStep();

      await ethers.provider.send("evm_mine", [
        parseInt(ethers.BigNumber.from(timestamp).add(addDays(3)).toString()),
      ]);

      const nbVote = await contract.getVotes("toto")
      expect(nbVote).to.equal(1);

      vote = await contract.voteByUser(this.owner.address);
      expect(vote).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });
});
