"""公开Python API和worker使用同一静态输入合同。"""

from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).parents[1] / 'python'))
from lani_anime_matcher.api import Matcher
from lani_anime_matcher.worker import ProtocolError


class StaticApiTests(unittest.TestCase):
    def setUp(self):
        self.matcher = Matcher([dict(id='s', title='独立候选火星邮递员 XYZ', aliases=[], year=None, quarter=None)])
        self.query = dict(aliases=['独立候选火星邮递员 XYZ'], publishedAt='2026-10-01T00:00:00+08:00', episode=1)

    def test_explicit_scope_and_empty_scope(self):
        self.assertEqual(self.matcher.match(self.query, ['s'])['seasonId'], 's')
        self.assertEqual(self.matcher.match(self.query, [])['seasonId'], None)
        with self.assertRaises(TypeError):
            self.matcher.match(self.query)
        with self.assertRaises(ValueError):
            self.matcher.match(self.query, ['missing'])
        with self.assertRaises(ValueError):
            self.matcher.match(self.query, ['s', 's'])

    def test_same_query_validation_as_worker(self):
        for extra in ({'episode': -1}, {'publishedAt': '2026-10-01'}, {'publisherSeason': -1}):
            with self.assertRaises(ProtocolError):
                self.matcher.match({**self.query, **extra}, ['s'])
        self.assertEqual(self.matcher.rank(self.query, ['s'])[0]['seasonId'], 's')


if __name__ == '__main__':
    unittest.main()
