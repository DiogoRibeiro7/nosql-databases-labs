"""Basic test to ensure pytest runs."""


def test_import():
    """Test that we can import required modules."""
    import faker
    import pymongo

    assert faker.__version__
    assert pymongo.version


def test_basic():
    """Basic test that always passes."""
    assert True