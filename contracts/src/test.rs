#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::EnvExt, BytesN, Bytes, Symbol, Env, Vec};

#[test]
fn test_init_success() {
    let env = Env::default();
    let contract = Contract;

    // Sample public key for initialization (65 bytes)
    let public_key = BytesN::<65>::from_array(&env, &[1u8; 65]);

    // Call init function and check for successful initialization
    let result = contract.init(env.clone(), public_key.clone());
    assert!(result.is_ok());

    // Ensure the public key is stored in the contract's storage
    let stored_pk: BytesN<65> = env.storage().instance().get(&STORAGE_KEY_PK).unwrap();
    assert_eq!(stored_pk, public_key);
}

#[test]
fn test_init_already_inited() {
    let env = Env::default();
    let contract = Contract;

    // Initialize the contract with a public key
    let public_key = BytesN::<65>::from_array(&env, &[1u8; 65]);
    contract.init(env.clone(), public_key.clone()).unwrap();

    // Try initializing again and check for an error
    let result = contract.init(env, public_key);
    assert_eq!(result, Err(Error::AlreadyInited));
}

#[test]
fn test_extend_ttl() {
    let env = Env::default();
    let contract = Contract;

    // Sample public key for initialization
    let public_key = BytesN::<65>::from_array(&env, &[1u8; 65]);

    // Call init function and ensure TTL is extended
    contract.init(env.clone(), public_key).unwrap();

    // Check that TTL was extended correctly
    let contract_address = env.current_contract_address();
    assert!(env.storage().instance().has(&STORAGE_KEY_PK));
    assert!(env.storage().instance().get_ttl().is_some());
    assert!(env.deployer().get_ttl(contract_address.clone()).is_some());
}

#[test]
fn test_check_auth_success() {
    let env = Env::default();
    let contract = Contract;

    // Initialize the contract with a public key
    let public_key = BytesN::<65>::from_array(&env, &[1u8; 65]);
    contract.init(env.clone(), public_key.clone()).unwrap();

    // Prepare mock signature data for verification
    let signature_payload = Hash::from_array(&[1u8; 32]);
    let authenticator_data = Bytes::from_array(&env, &[1u8; 10]);
    let client_data_json = Bytes::from_array(&env, &[1u8; 10]);
    let signature = BytesN::<64>::from_array(&env, &[1u8; 64]);

    let signature_data = Signature {
        authenticator_data,
        client_data_json,
        signature,
    };

    // Verify the signature (mock the crypto part for the test)
    let result = contract.__check_auth(
        env.clone(),
        signature_payload.clone(),
        signature_data,
        Vec::new(&env),
    );
    assert!(result.is_ok());
}

#[test]
fn test_check_auth_invalid_signature() {
    let env = Env::default();
    let contract = Contract;

    // Initialize the contract with a public key
    let public_key = BytesN::<65>::from_array(&env, &[1u8; 65]);
    contract.init(env.clone(), public_key.clone()).unwrap();

    // Prepare mock signature data with an incorrect signature
    let signature_payload = Hash::from_array(&[1u8; 32]);
    let authenticator_data = Bytes::from_array(&env, &[1u8; 10]);
    let client_data_json = Bytes::from_array(&env, &[1u8; 10]);
    let signature = BytesN::<64>::from_array(&env, &[2u8; 64]); // Different signature

    let signature_data = Signature {
        authenticator_data,
        client_data_json,
        signature,
    };

    // Attempt to verify the invalid signature
    let result = contract.__check_auth(
        env.clone(),
        signature_payload.clone(),
        signature_data,
        Vec::new(&env),
    );
    assert_eq!(result, Err(Error::Secp256r1VerifyFailed));
}
