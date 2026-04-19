'use strict';

interface CapabilityMapping {
  platforms: string[];
  minFwMajor: number;
  minFwMinor: number;
}

interface ActiveWatchInfo {
  platform: string;
  firmware: {
    major: number;
    minor: number;
  };
}

/**
 * Batch update all the properties of an object.
 */
function updateProperties(obj: object, descriptor: PropertyDescriptor): void {
  Object.getOwnPropertyNames(obj).forEach(function(prop) {
    Object.defineProperty(obj, prop, descriptor);
  });
}

const capabilityMap: Record<string, CapabilityMapping> = {
  PLATFORM_APLITE: {
    platforms: ['aplite'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  PLATFORM_BASALT: {
    platforms: ['basalt'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  PLATFORM_CHALK: {
    platforms: ['chalk'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  PLATFORM_DIORITE: {
    platforms: ['diorite'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  PLATFORM_EMERY: {
    platforms: ['emery'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  PLATFORM_FLINT: {
    platforms: ['flint'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  PLATFORM_GABBRO: {
    platforms: ['gabbro'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  BW: {
    platforms: ['aplite', 'diorite', 'flint'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  COLOR: {
    platforms: ['basalt', 'chalk', 'emery', 'gabbro'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  MICROPHONE: {
    platforms: ['basalt', 'chalk', 'diorite', 'emery', 'flint', 'gabbro'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  SMARTSTRAP: {
    platforms: ['basalt', 'chalk', 'diorite', 'emery'],
    minFwMajor: 3,
    minFwMinor: 4
  },
  SMARTSTRAP_POWER: {
    platforms: ['basalt', 'chalk', 'emery'],
    minFwMajor: 3,
    minFwMinor: 4
  },
  HEALTH: {
    platforms: ['basalt', 'chalk', 'diorite', 'emery', 'flint', 'gabbro'],
    minFwMajor: 3,
    minFwMinor: 10
  },
  RECT: {
    platforms: ['aplite', 'basalt', 'diorite', 'emery', 'flint'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  ROUND: {
    platforms: ['chalk', 'gabbro'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  DISPLAY_144x168: {
    platforms: ['aplite', 'basalt', 'diorite', 'flint'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  DISPLAY_180x180_ROUND: {
    platforms: ['chalk'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  DISPLAY_200x228: {
    platforms: ['emery'],
    minFwMajor: 0,
    minFwMinor: 0
  },
  DISPLAY_260x260_ROUND: {
    platforms: ['gabbro'],
    minFwMajor: 0,
    minFwMinor: 0
  }
};

/**
 * Checks if all of the provided capabilities are compatible with the watch.
 */
function includesCapability(activeWatchInfo: ActiveWatchInfo, capabilities?: string[]): boolean {
  var notRegex = /^NOT_/;
  var result: boolean[] = [];

  if (!capabilities || !capabilities.length) {
    return true;
  }

  for (var i = capabilities.length - 1; i >= 0; i--) {
    var capability = capabilities[i];
    var mapping = capabilityMap[capability.replace(notRegex, '')];

    if (!mapping ||
        mapping.platforms.indexOf(activeWatchInfo.platform) === -1 ||
        mapping.minFwMajor > activeWatchInfo.firmware.major ||
        mapping.minFwMajor === activeWatchInfo.firmware.major &&
        mapping.minFwMinor > activeWatchInfo.firmware.minor
    ) {
      result.push(!!capability.match(notRegex));
    } else {
      result.push(!capability.match(notRegex));
    }
  }

  return result.indexOf(false) === -1;
}

export = { updateProperties, capabilityMap, includesCapability };
