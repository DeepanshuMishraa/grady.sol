import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GradySol } from "../target/types/grady_sol";
import { BN } from "bn.js";

describe("grady-sol", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.gradySol as Program<GradySol>;

  const signer = anchor.web3.Keypair.generate();

  const [gradePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("grade-tracker"), signer.publicKey.toBuffer()],
    program.programId
  );

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
      .signers([signer])
      .accounts({
        signer: signer.publicKey,
        gradeTracker: gradePda,
      } as any)
      .rpc();

    console.log("Grade Tracker initialization signature:", tx);
  });

  it("Add Subject", async () => {
    const txn = await program.methods
      .addGrades("Maths", new BN(100))
      .accounts({
        signer: signer.publicKey,
        gradeTracker: gradePda,
      } as any)
      .signers([signer])
      .rpc();

    const grades = await program.account.gradeTracker.fetch(gradePda);

    console.log(`Subject : ${grades.subjects[0].name}`);
    console.log(`Grade : ${grades.subjects[0].score.toNumber()}`);

    console.log("Add Subject transaction signature:", txn);
  });

  it("Update a Grade", async () => {
    const txn = await program.methods
      .updateGrades(new BN(0), new BN(90))
      .accounts({
        signer: signer.publicKey,
        gradeTracker: gradePda,
      } as any)
      .signers([signer])
      .rpc();

    const grades = await program.account.gradeTracker.fetch(gradePda);

    console.log(`Subject : ${grades.subjects[0].name}`);
    console.log(`Grade : ${grades.subjects[0].score.toNumber()}`);

    console.log("Update Grade transaction signature:", txn);
  });

  it("Delete a Grade", async () => {
    const txn = await program.methods
      .deleteGrade(new BN(0))
      .accounts({
        signer: signer.publicKey,
        gradeTracker: gradePda,
      } as any)
      .signers([signer])
      .rpc();

    console.log("Delete Grade transaction signature:", txn);
  });
});
