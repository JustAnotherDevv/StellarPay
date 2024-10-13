#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Address, Env, Map, String, Symbol, Vec, Error};

#[contracttype]
pub enum DataKey {
    Member(Address),
    Group(Symbol),
    Transaction(Address), // Modified to only use Address
}

#[contracttype]
pub struct Member {
    nickname: String,
    address: Address,
}

#[contracttype]
pub struct Group {
    group_id: Symbol,
    owner: Address,
    members: Map<Address, i128>,
}

#[contracttype]
pub struct Transaction {
    user_id: Address,
    group_id: Symbol,
    amounts: Map<Address, i128>,
    proof: String,
    approvals: Vec<Address>,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    // Member functions
    pub fn set_member(env: Env, address: Address, nickname: String) {
        address.require_auth();
        let member = Member { nickname, address: address.clone() };
        env.storage().instance().set(&DataKey::Member(address), &member);
    }

    pub fn get_member(env: Env, address: Address) -> Result<Member, Error> {
        env.storage().instance().get(&DataKey::Member(address)).ok_or_else(|| Error::from_contract_error(1))
    }

    // Group functions
    pub fn set_group(env: Env, group_id: Symbol, owner: Address, members: Map<Address, i128>) {
        let group = Group { group_id: group_id.clone(), owner, members };
        env.storage().instance().set(&DataKey::Group(group_id), &group);
    }

    pub fn get_group(env: Env, group_id: Symbol) -> Result<Group, Error> {
        env.storage().instance().get(&DataKey::Group(group_id)).ok_or_else(|| Error::from_contract_error(2))
    }

    pub fn add_group_member(env: Env, group_id: Symbol, member_address: Address, balance: i128) -> Result<(), Error> {
        let mut group: Group = env.storage().instance().get(&DataKey::Group(group_id.clone())).ok_or_else(|| Error::from_contract_error(2))?;
        group.members.set(member_address, balance);
        env.storage().instance().set(&DataKey::Group(group_id), &group);
        Ok(())
    }

    pub fn update_group_member_balance(env: Env, group_id: Symbol, member_address: Address, new_balance: i128) -> Result<(), Error> {
        let mut group: Group = env.storage().instance().get(&DataKey::Group(group_id.clone())).ok_or_else(|| Error::from_contract_error(2))?;
        group.members.set(member_address, new_balance);
        env.storage().instance().set(&DataKey::Group(group_id), &group);
        Ok(())
    }

    // Transaction functions
    pub fn set_transaction(env: Env, user_id: Address, group_id: Symbol, amounts: Map<Address, i128>, proof: String) {
        let transaction = Transaction {
            user_id: user_id.clone(),
            group_id,
            amounts,
            proof,
            approvals: Vec::new(&env),
        };
        env.storage().instance().set(&DataKey::Transaction(user_id), &transaction);
    }

    pub fn get_transaction(env: Env, user_id: Address) -> Result<Transaction, Error> {
        env.storage().instance().get(&DataKey::Transaction(user_id)).ok_or_else(|| Error::from_contract_error(3))
    }

    pub fn add_approval(env: Env, user_id: Address, approver: Address) -> Result<(), Error> {
        let mut transaction: Transaction = env.storage().instance().get(&DataKey::Transaction(user_id.clone())).ok_or_else(|| Error::from_contract_error(3))?;
        transaction.approvals.push_back(approver);
        env.storage().instance().set(&DataKey::Transaction(user_id), &transaction);
        Ok(())
    }
}
