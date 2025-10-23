import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GradySol } from "../target/types/grady_sol";
import { BN } from "bn.js";

describe("grady-sol", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.gradySol as Program<GradySol>;

  const signer = anchor.web3.Keypair.generate();
  const grade = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        signer.publicKey,
        100 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );
    const tx = await program.methods
      .initialize()
      .signers([signer, grade])
      .accounts({
        signer: signer.publicKey,
        gradeTracker: grade.publicKey,
      })
      .rpc();

    console.log("Grade Tracker initialization signature:", tx);
  });

  it("Add Subject", async () => {
    const txn = await program.methods
      .addGrades("Maths", new BN(100))
      .accounts({
        gradeTracker: grade.publicKey,
      })
      .rpc();

    const grades = await program.account.gradeTracker.fetch(grade.publicKey);

    console.log(`Subject : ${grades.subjects[0].name}`);
    console.log(`Grade : ${grades.subjects[0].score.toNumber()}`);

    console.log("Add Subject transaction signature:", txn);
  });

  it("Update a Grade", async () => {
    const txn = await program.methods
      .updateGrades(new BN(0), new BN(90))
      .accounts({
        gradeTracker: grade.publicKey,
      })
      .rpc();

    const grades = await program.account.gradeTracker.fetch(grade.publicKey);

    console.log(`Subject : ${grades.subjects[0].name}`);
    console.log(`Grade : ${grades.subjects[0].score.toNumber()}`);

    console.log("Update Grade transaction signature:", txn);
  });

  it("Delete a Grade", async () => {
    const txn = await program.methods
      .deleteGrade(new BN(0))
      .accounts({
        gradeTracker: grade.publicKey,
      })
      .rpc();

    console.log("Delete Grade transaction signature:", txn);
  });
});
