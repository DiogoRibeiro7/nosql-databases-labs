"""Basic test to ensure pytest runs."""


def test_import():
    """Test that we can import required modules."""
    try:
        import faker
        from faker import Faker
        assert Faker
    except ImportError:
        assert False, "Could not import faker"

    try:
        import pymongo
        assert pymongo.version
    except ImportError:
        assert False, "Could not import pymongo"


def test_basic():
    """Basic test that always passes."""
    assert True


def test_faker_basic():
    """Test basic faker functionality."""
    from faker import Faker
    fake = Faker()
    name = fake.name()
    assert isinstance(name, str)
    assert len(name) > 0