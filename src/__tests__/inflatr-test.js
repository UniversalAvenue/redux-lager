import { normalize, Schema, arrayOf } from 'normalizr';
jest.dontMock('../inflatr');

const inflate = require('../inflatr').inflate;

describe('Inflate', () => {
  const user = new Schema('users');
  const role = new Schema('roles');
  const address = new Schema('addresses');
  user.define({
    role,
    locations: arrayOf(address),
  });

  const kalle = {
    id: 5,
    role: {
      name: 'Kalix',
      id: 2,
    },
    locations: [
      { id: 1, name: 'home' },
      { id: 2, name: 'work' },
      { id: 3, name: 'hospice' },
    ],
  };

  const olle = {
    id: 6,
    role: {
      name: 'Phenix',
      id: 3,
    },
    locations: [
      { id: 1, name: 'home' },
      { id: 2, name: 'work' },
      { id: 3, name: 'hospice' },
    ],
  };

  const db = {
    items: arrayOf(user),
  };

  const allUsers = {
    items: [
      kalle,
      olle,
    ],
  };

  const weirdSchema = {
    item: {
      user,
    },
  };

  const weirdData = {
    item: {
      user: kalle,
    },
  };

  const selectEntity = type => id => entities => entities[type][id];
  it('should reinflate a nested object', () => {
    const response = normalize(kalle, user);
    const inflated = inflate(response.result, user, selectEntity)(response.entities);

    expect(inflated).toEqual(kalle);
  });
  it('should reinflate a more nested object', () => {
    const response = normalize(allUsers, db);
    const inflated = inflate(response.result, db, selectEntity)(response.entities);

    expect(inflated).toEqual(allUsers);
  });
  it('should reinflate a weird structure', () => {
    const response = normalize(weirdData, weirdSchema);
    const inflated = inflate(response.result, weirdSchema, selectEntity)(response.entities);

    expect(inflated).toEqual(weirdData);
  });
});
