#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, Map, Symbol, log, panic_with_error, contracterror};

#[derive(Clone, Debug)]
#[contracttype]
pub struct Group {
    group_id: u64,
    owner: Address,
    total_amount: u64,
    members: Vec<Symbol>,
}

#[derive(Clone)]
#[contracttype]
pub struct Member {
    user_id: Symbol,
    address: Address,
    group_balances: Map<u64, u64>,
}

#[derive(Clone)]
#[contracttype]
pub struct Transaction {
    user_id: Symbol,
    group_id: u64,
    amount: u64,
    proof: Symbol,  // IPFS link
    approvals: Vec<Symbol>,
}

#[derive(Clone, PartialEq, Eq)]
#[contracttype]
pub enum DataKey {
    Group(u64),
    Member(Symbol),
    Transaction(u64),
    LastGroupId,
    LastTransactionId,
    GroupList,  // List of all groups
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    GroupAlreadyExists = 1,
    GroupNotFound = 2,
    Unauthorized = 3,
    MemberAlreadyExists = 4,
    MemberNotFound = 5,
    UserIdAlreadyExists = 6,
    GroupCreationFailed = 7,
}

#[contract]
pub struct MappingContract;

#[contractimpl]
impl MappingContract {
    pub fn create_group(env: &Env, owner: Address) -> u64 {
        log!(env, "Entering create_group function");
        log!(env, "Owner address: {:?}", owner);

        let group_id = Self::get_next_group_id(env);
        log!(env, "Generated new group_id: {}", group_id);

        let owner_symbol = Symbol::short("owner");
        log!(env, "Created owner symbol: {:?}", owner_symbol);

        let members = Vec::from_array(env, [owner_symbol]);
        log!(env, "Created members vector: {:?}", members);

        let group = Group {
            group_id,
            owner: owner.clone(),
            total_amount: 0,
            members: Vec::new(env),
        };
        log!(env, "Created new group: {:?}", group);

        // Store the individual group
        env.storage().persistent().set(&DataKey::Group(group_id), &group);
        log!(env, "Stored individual group in persistent storage");

        // Update the list of all groups
        let mut group_list = env.storage().persistent().get::<DataKey, Vec<Group>>(&DataKey::GroupList)
            .unwrap_or_else(|| {
                log!(env, "Group list not found, creating new list");
                Vec::new(env)
            });
        log!(env, "Current group list size: {}", group_list.len());

        group_list.push_back(group);
        log!(env, "Added new group to list. New size: {}", group_list.len());

        env.storage().persistent().set(&DataKey::GroupList, &group_list);
        log!(env, "Stored updated group list in persistent storage");

        log!(env, "Exiting create_group function. Returning group_id: {}", group_id);
        group_id
    }

    pub fn create_member(env: &Env, user_id: Symbol, address: Address) {
        if env.storage().persistent().has(&DataKey::Member(user_id.clone())) {
            panic_with_error!(env, Error::UserIdAlreadyExists);
        }
        let member = Member {
            user_id: user_id.clone(),
            address,
            group_balances: Map::new(env),
        };
        env.storage().persistent().set(&DataKey::Member(user_id), &member);
    }

    pub fn add_member_to_group(env: &Env, group_id: u64, user_id: Symbol, caller: Address) {
        let mut group = env.storage().persistent().get::<DataKey, Group>(&DataKey::Group(group_id))
            .unwrap_or_else(|| panic_with_error!(env, Error::GroupNotFound));

        if group.owner != caller {
            panic_with_error!(env, Error::Unauthorized);
        }

        if group.members.contains(&user_id) {
            panic_with_error!(env, Error::MemberAlreadyExists);
        }

        group.members.push_back(user_id.clone());
        env.storage().persistent().set(&DataKey::Group(group_id), &group);

        let mut member = env.storage().persistent().get::<DataKey, Member>(&DataKey::Member(user_id.clone()))
            .unwrap_or_else(|| panic_with_error!(env, Error::MemberNotFound));
        member.group_balances.set(group_id, 0);
        env.storage().persistent().set(&DataKey::Member(user_id), &member);
    }

    pub fn add_transaction(env: &Env, user_id: Symbol, group_id: u64, amount: u64, proof: Symbol) -> u64 {
        let tx_id = Self::get_next_transaction_id(env);
        let transaction = Transaction {
            user_id: user_id.clone(),
            group_id,
            amount,
            proof,
            approvals: Vec::new(env),
        };
        env.storage().persistent().set(&DataKey::Transaction(tx_id), &transaction);

        // Update group total amount
        let mut group = env.storage().persistent().get::<DataKey, Group>(&DataKey::Group(group_id))
            .unwrap_or_else(|| panic_with_error!(env, Error::GroupNotFound));
        group.total_amount += amount;
        env.storage().persistent().set(&DataKey::Group(group_id), &group);

        // Update member's balance in the group
        let mut member = env.storage().persistent().get::<DataKey, Member>(&DataKey::Member(user_id.clone()))
            .unwrap_or_else(|| panic_with_error!(env, Error::MemberNotFound));
        let new_balance = member.group_balances.get(group_id).unwrap_or(0) + amount;
        member.group_balances.set(group_id, new_balance);
        env.storage().persistent().set(&DataKey::Member(user_id.clone()), &member);

        tx_id
    }

    pub fn approve_transaction(env: &Env, tx_id: u64, approver_id: Symbol) {
        let mut transaction = env.storage().persistent().get::<DataKey, Transaction>(&DataKey::Transaction(tx_id))
            .unwrap_or_else(|| panic_with_error!(env, Error::GroupNotFound));
        
        let group = env.storage().persistent().get::<DataKey, Group>(&DataKey::Group(transaction.group_id))
            .unwrap_or_else(|| panic_with_error!(env, Error::GroupNotFound));

        if !group.members.contains(&approver_id) {
            panic_with_error!(env, Error::Unauthorized);
        }

        if !transaction.approvals.contains(&approver_id) {
            transaction.approvals.push_back(approver_id);
            env.storage().persistent().set(&DataKey::Transaction(tx_id), &transaction);
        }
    }

    pub fn get_all_groups(env: &Env) -> Vec<Group> {
        env.storage().persistent().get::<DataKey, Vec<Group>>(&DataKey::GroupList)
            .unwrap_or_else(|| Vec::new(env))
    }

    fn get_next_group_id(env: &Env) -> u64 {
        log!(env, "Entering get_next_group_id function");

        let last_id = env.storage().persistent().get::<DataKey, u64>(&DataKey::LastGroupId).unwrap_or(0);
        log!(env, "Last group ID: {}", last_id);

        let new_id = last_id.checked_add(1).unwrap_or_else(|| {
            log!(env, "Group ID overflow occurred");
            panic_with_error!(env, Error::GroupCreationFailed);
        });
        log!(env, "New group ID: {}", new_id);

        env.storage().persistent().set(&DataKey::LastGroupId, &new_id);
        log!(env, "Stored new last group ID in persistent storage");

        log!(env, "Exiting get_next_group_id function. Returning new_id: {}", new_id);
        new_id
    }

    fn get_next_transaction_id(env: &Env) -> u64 {
        let last_id = env.storage().persistent().get::<DataKey, u64>(&DataKey::LastTransactionId).unwrap_or(0);
        let new_id = last_id.checked_add(1).unwrap_or_else(|| panic_with_error!(env, Error::GroupCreationFailed));
        env.storage().persistent().set(&DataKey::LastTransactionId, &new_id);
        new_id
    }
}