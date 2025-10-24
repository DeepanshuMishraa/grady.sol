use anchor_lang::prelude::*;

declare_id!("Fka9t2Rd25TYLCYYaVzKcCiD6A11T6dKQucZLMdFd3JV");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod grady_sol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Welcome to Grady Sol!. Your very own grade tracker!");
        let tracker = &mut ctx.accounts.grade_tracker;
        tracker.subjects = Vec::new();

        msg!("Grade tracker initialized successfully!");
        Ok(())
    }

    pub fn add_grades(ctx: Context<UpdateGrade>, subject_name: String, score: u64) -> Result<()> {
        let tracker = &mut ctx.accounts.grade_tracker;
        let subject = Subject {
            name: subject_name.clone(),
            score,
        };

        tracker.subjects.push(subject);

        msg!("Added score {} for subject {}", score, subject_name);

        Ok(())
    }

    pub fn update_grades(ctx: Context<UpdateGrade>, id: u64, score: u64) -> Result<()> {
        let tracker = &mut ctx.accounts.grade_tracker;
        let subject = &mut tracker.subjects[id as usize];
        subject.score = score;

        msg!("Updated score of {} to {}", subject.name, score);
        Ok(())
    }

    pub fn delete_grade(ctx: Context<UpdateGrade>, id: u64) -> Result<()> {
        let tracker = &mut ctx.accounts.grade_tracker;
        tracker.subjects.remove(id as usize);
        msg!("Subject Deleted!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + GradeTracker::INIT_SPACE,
        seeds = [b"grade-tracker", signer.key().as_ref()],
        bump
    )]
    pub grade_tracker: Account<'info, GradeTracker>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGrade<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
    mut,
    seeds = [b"grade-tracker",signer.key().as_ref()],
    bump = grade_tracker.bump
    )]
    pub grade_tracker: Account<'info, GradeTracker>,
}

#[account]
#[derive(InitSpace)] //e InitSpace added for grade tracker because Vec<Subject> had memory unknown at the time of creation
pub struct GradeTracker {
    #[max_len(50)]
    pub subjects: Vec<Subject>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Subject {
    #[max_len(50)]
    pub name: String,
    pub score: u64,
}
